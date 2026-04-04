package com.todo.service;

import com.todo.dto.request.TodoCreateRequest;
import com.todo.dto.request.TodoQueryRequest;
import com.todo.dto.request.TodoUpdateRequest;
import com.todo.dto.response.TodoResponse;
import com.todo.entity.TodoItem;
import com.todo.mapper.TodoMapper;
import com.todo.service.impl.TodoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TodoServiceTest {

    @Mock
    private TodoMapper todoMapper;

    @Mock
    private CategoryService categoryService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private TodoServiceImpl todoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateTodo() {
        TodoCreateRequest request = new TodoCreateRequest();
        request.setTitle("测试任务");
        request.setPriority(1);

        // 模拟 insert 操作设置 ID
        when(todoMapper.insert(any(TodoItem.class))).thenAnswer(invocation -> {
            TodoItem todo = invocation.getArgument(0);
            todo.setId(1L);
            return 1;
        });

        TodoResponse response = todoService.createTodo(request);

        assertNotNull(response);
        assertEquals("测试任务", response.getTitle());
        verify(auditLogService).log(eq("TODO"), eq(1L), eq("CREATE"), isNull(), anyString());
    }

    @Test
    void testCompleteTodo() {
        TodoItem todo = TodoItem.builder()
                .id(1L)
                .title("待完成任务")
                .status(0)
                .priority(1)
                .isDeleted(false)
                .build();

        when(todoMapper.selectById(1L)).thenReturn(todo);
        when(todoMapper.updateById(any())).thenReturn(1);

        todoService.completeTodo(1L);

        assertEquals(1, todo.getStatus());
        assertNotNull(todo.getCompletedAt());
        verify(auditLogService).log(eq("TODO"), eq(1L), eq("UPDATE"), anyString(), anyString());
    }
}