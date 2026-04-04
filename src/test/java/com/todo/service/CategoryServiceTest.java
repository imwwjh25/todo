package com.todo.service;

import com.todo.dto.request.CategoryCreateRequest;
import com.todo.dto.request.CategoryUpdateRequest;
import com.todo.dto.response.CategoryResponse;
import com.todo.entity.Category;
import com.todo.mapper.CategoryMapper;
import com.todo.mapper.TodoMapper;
import com.todo.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CategoryServiceTest {

    @Mock
    private CategoryMapper categoryMapper;

    @Mock
    private TodoMapper todoMapper;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateCategory() {
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setName("测试分类");
        request.setSortOrder(1);

        when(categoryMapper.insert(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(1L);
            return 1;
        });

        CategoryResponse response = categoryService.createCategory(request);

        assertNotNull(response);
        assertEquals("测试分类", response.getName());
        assertEquals(1, response.getSortOrder());
        verify(auditLogService).log(eq("CATEGORY"), anyLong(), eq("CREATE"), isNull(), anyString());
    }

    @Test
    void testGetAllCategories() {
        Category cat1 = Category.builder().id(1L).name("工作").sortOrder(1).isDeleted(false).build();
        Category cat2 = Category.builder().id(2L).name("生活").sortOrder(2).isDeleted(false).build();

        when(categoryMapper.selectList(any())).thenReturn(Arrays.asList(cat1, cat2));

        List<CategoryResponse> responses = categoryService.getAllCategories();

        assertEquals(2, responses.size());
        assertEquals("工作", responses.get(0).getName());
        assertEquals("生活", responses.get(1).getName());
    }

    @Test
    void testGetById() {
        Category category = Category.builder()
                .id(1L)
                .name("工作")
                .sortOrder(1)
                .isDeleted(false)
                .build();

        when(categoryMapper.selectById(1L)).thenReturn(category);

        CategoryResponse response = categoryService.getById(1L);

        assertNotNull(response);
        assertEquals("工作", response.getName());
        assertEquals(1, response.getSortOrder());
    }

    @Test
    void testUpdateCategory() {
        Category existingCategory = Category.builder()
                .id(1L)
                .name("工作")
                .sortOrder(1)
                .isDeleted(false)
                .build();

        when(categoryMapper.selectById(1L)).thenReturn(existingCategory);
        when(categoryMapper.updateById(any(Category.class))).thenReturn(1);

        CategoryUpdateRequest request = new CategoryUpdateRequest();
        request.setName("学习");
        request.setSortOrder(2);

        CategoryResponse response = categoryService.updateCategory(1L, request);

        assertNotNull(response);
        assertEquals("学习", response.getName());
        assertEquals(2, response.getSortOrder());
        verify(auditLogService).log(eq("CATEGORY"), eq(1L), eq("UPDATE"), anyString(), anyString());
    }

    @Test
    void testDeleteCategory() {
        Category category = Category.builder()
                .id(1L)
                .name("工作")
                .sortOrder(1)
                .isDeleted(false)
                .build();

        when(categoryMapper.selectById(1L)).thenReturn(category);
        when(categoryMapper.deleteById(1L)).thenReturn(1);

        categoryService.deleteCategory(1L);

        verify(categoryMapper).deleteById(1L);
        verify(auditLogService).log(eq("CATEGORY"), eq(1L), eq("DELETE"), anyString(), isNull());
    }
}