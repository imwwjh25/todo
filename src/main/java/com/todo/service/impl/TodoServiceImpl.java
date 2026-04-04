package com.todo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.todo.common.enums.Priority;
import com.todo.common.enums.Status;
import com.todo.common.exception.ResourceNotFoundException;
import com.todo.dto.request.TodoCreateRequest;
import com.todo.dto.request.TodoQueryRequest;
import com.todo.dto.request.TodoUpdateRequest;
import com.todo.dto.response.AuditLogResponse;
import com.todo.dto.response.PageResponse;
import com.todo.dto.response.TodoResponse;
import com.todo.entity.Category;
import com.todo.entity.TodoItem;
import com.todo.mapper.CategoryMapper;
import com.todo.mapper.TodoMapper;
import com.todo.service.AuditLogService;
import com.todo.service.TodoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 任务服务实现类
 */
@Service
@RequiredArgsConstructor
public class TodoServiceImpl implements TodoService {

    private final TodoMapper todoMapper;
    private final CategoryMapper categoryMapper;
    private final AuditLogService auditLogService;

    // ObjectMapper 配置为支持 Java 8 日期时间类型
    private ObjectMapper objectMapper = createObjectMapper();

    private static ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"stats:category", "stats:priority"}, allEntries = true)
    @SneakyThrows
    public TodoResponse createTodo(TodoCreateRequest request) {
        TodoItem todo = TodoItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .categoryId(request.getCategoryId())
                .priority(request.getPriority() != null ? request.getPriority() : 1)
                .status(0)
                .dueDate(parseDueDate(request.getDueDate()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        todoMapper.insert(todo);
        auditLogService.log("TODO", todo.getId(), "CREATE", null, objectMapper.writeValueAsString(todo));

        return toResponse(todo);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"stats:category", "stats:priority"}, allEntries = true)
    @SneakyThrows
    public TodoResponse updateTodo(Long id, TodoUpdateRequest request) {
        TodoItem oldTodo = todoMapper.selectById(id);
        if (oldTodo == null || oldTodo.getIsDeleted()) {
            throw new ResourceNotFoundException("TodoItem", id);
        }

        String oldValue = objectMapper.writeValueAsString(oldTodo);

        if (request.getTitle() != null) {
            oldTodo.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            oldTodo.setDescription(request.getDescription());
        }
        if (request.getCategoryId() != null) {
            oldTodo.setCategoryId(request.getCategoryId());
        }
        if (request.getPriority() != null) {
            oldTodo.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            oldTodo.setDueDate(parseDueDate(request.getDueDate()));
        }
        oldTodo.setUpdatedAt(LocalDateTime.now());

        todoMapper.updateById(oldTodo);
        auditLogService.log("TODO", id, "UPDATE", oldValue, objectMapper.writeValueAsString(oldTodo));

        return toResponse(oldTodo);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"stats:category", "stats:priority", "stats:completion-time"}, allEntries = true)
    @SneakyThrows
    public void deleteTodo(Long id) {
        TodoItem todo = todoMapper.selectById(id);
        if (todo == null || todo.getIsDeleted()) {
            throw new ResourceNotFoundException("TodoItem", id);
        }

        String oldValue = objectMapper.writeValueAsString(todo);
        todoMapper.deleteById(id);
        auditLogService.log("TODO", id, "DELETE", oldValue, null);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"stats:category", "stats:priority", "stats:completion-time"}, allEntries = true)
    @SneakyThrows
    public TodoResponse completeTodo(Long id) {
        TodoItem todo = todoMapper.selectById(id);
        if (todo == null || todo.getIsDeleted()) {
            throw new ResourceNotFoundException("TodoItem", id);
        }

        String oldValue = objectMapper.writeValueAsString(todo);

        todo.setStatus(1);
        todo.setCompletedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());

        todoMapper.updateById(todo);
        auditLogService.log("TODO", id, "UPDATE", oldValue, objectMapper.writeValueAsString(todo));

        return toResponse(todo);
    }

    @Override
    public TodoResponse getById(Long id) {
        TodoItem todo = todoMapper.selectById(id);
        if (todo == null || todo.getIsDeleted()) {
            throw new ResourceNotFoundException("TodoItem", id);
        }
        return toResponse(todo);
    }

    @Override
    public PageResponse<TodoResponse> queryTodos(TodoQueryRequest request) {
        Page<TodoItem> page = new Page<>(request.getPage() + 1, request.getSize());

        LambdaQueryWrapper<TodoItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TodoItem::getIsDeleted, false);

        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(TodoItem::getTitle, request.getKeyword())
                    .or()
                    .like(TodoItem::getDescription, request.getKeyword()));
        }
        if (request.getCategoryId() != null) {
            wrapper.eq(TodoItem::getCategoryId, request.getCategoryId());
        }
        if (request.getPriority() != null) {
            wrapper.eq(TodoItem::getPriority, request.getPriority());
        }
        if (request.getStatus() != null) {
            wrapper.eq(TodoItem::getStatus, request.getStatus());
        }
        if (request.getStartDate() != null) {
            wrapper.ge(TodoItem::getCreatedAt, request.getStartDate().atStartOfDay());
        }
        if (request.getEndDate() != null) {
            wrapper.le(TodoItem::getCreatedAt, request.getEndDate().atTime(23, 59, 59));
        }

        wrapper.orderByDesc(TodoItem::getCreatedAt);

        IPage<TodoItem> result = todoMapper.selectPage(page, wrapper);

        List<TodoResponse> responses = result.getRecords().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses, result.getTotal(), (int) result.getCurrent() - 1, (int) result.getSize());
    }

    @Override
    public List<TodoResponse> getHistory(Long id) {
        List<AuditLogResponse> logs = auditLogService.getHistory("TODO", id);
        // 返回历史记录转换为响应格式（此处简化返回当前状态）
        TodoItem current = todoMapper.selectById(id);
        if (current == null) {
            throw new ResourceNotFoundException("TodoItem", id);
        }
        return List.of(toResponse(current));
    }

    private LocalDateTime parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isEmpty()) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(dueDate, DateTimeFormatter.ISO_LOCAL_DATE);
            return date.atTime(23, 59, 59);
        } catch (Exception e) {
            return null;
        }
    }

    private TodoResponse toResponse(TodoItem todo) {
        TodoResponse response = new TodoResponse();
        response.setId(todo.getId());
        response.setTitle(todo.getTitle());
        response.setDescription(todo.getDescription());
        response.setCategoryId(todo.getCategoryId());
        response.setPriority(todo.getPriority());
        response.setPriorityName(Priority.fromCode(todo.getPriority()).getName());
        response.setStatus(todo.getStatus());
        response.setStatusName(Status.fromCode(todo.getStatus()).getName());
        response.setDueDate(todo.getDueDate());
        response.setCompletedAt(todo.getCompletedAt());
        response.setCreatedAt(todo.getCreatedAt());
        response.setUpdatedAt(todo.getUpdatedAt());

        if (todo.getCategoryId() != null) {
            Category category = categoryMapper.selectById(todo.getCategoryId());
            if (category != null) {
                response.setCategoryName(category.getName());
            }
        }

        return response;
    }
}