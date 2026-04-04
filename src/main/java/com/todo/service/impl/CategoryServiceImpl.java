package com.todo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.todo.common.exception.ResourceNotFoundException;
import com.todo.dto.request.CategoryCreateRequest;
import com.todo.dto.request.CategoryUpdateRequest;
import com.todo.dto.response.CategoryResponse;
import com.todo.entity.Category;
import com.todo.mapper.CategoryMapper;
import com.todo.mapper.TodoMapper;
import com.todo.service.AuditLogService;
import com.todo.service.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 分类服务实现类
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final TodoMapper todoMapper;
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
    @SneakyThrows
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        categoryMapper.insert(category);
        auditLogService.log("CATEGORY", category.getId(), "CREATE", null, objectMapper.writeValueAsString(category));

        return toResponse(category);
    }

    @Override
    @Transactional
    @SneakyThrows
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category oldCategory = categoryMapper.selectById(id);
        if (oldCategory == null || oldCategory.getIsDeleted()) {
            throw new ResourceNotFoundException("Category", id);
        }

        String oldValue = objectMapper.writeValueAsString(oldCategory);

        if (request.getName() != null) {
            oldCategory.setName(request.getName());
        }
        if (request.getSortOrder() != null) {
            oldCategory.setSortOrder(request.getSortOrder());
        }
        oldCategory.setUpdatedAt(LocalDateTime.now());

        categoryMapper.updateById(oldCategory);
        auditLogService.log("CATEGORY", id, "UPDATE", oldValue, objectMapper.writeValueAsString(oldCategory));

        return toResponse(oldCategory);
    }

    @Override
    @Transactional
    @SneakyThrows
    public void deleteCategory(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null || category.getIsDeleted()) {
            throw new ResourceNotFoundException("Category", id);
        }

        String oldValue = objectMapper.writeValueAsString(category);
        categoryMapper.deleteById(id);
        auditLogService.log("CATEGORY", id, "DELETE", oldValue, null);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getIsDeleted, false)
               .orderByAsc(Category::getSortOrder);

        List<Category> categories = categoryMapper.selectList(wrapper);
        return categories.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null || category.getIsDeleted()) {
            throw new ResourceNotFoundException("Category", id);
        }
        return toResponse(category);
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSortOrder(category.getSortOrder());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }
}