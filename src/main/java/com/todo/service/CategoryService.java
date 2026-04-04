package com.todo.service;

import com.todo.dto.request.CategoryCreateRequest;
import com.todo.dto.request.CategoryUpdateRequest;
import com.todo.dto.response.CategoryResponse;
import java.util.List;

/**
 * 分类服务接口
 */
public interface CategoryService {

    /**
     * 创建分类
     */
    CategoryResponse createCategory(CategoryCreateRequest request);

    /**
     * 更新分类
     */
    CategoryResponse updateCategory(Long id, CategoryUpdateRequest request);

    /**
     * 删除分类（逻辑删除）
     */
    void deleteCategory(Long id);

    /**
     * 获取所有分类列表
     */
    List<CategoryResponse> getAllCategories();

    /**
     * 根据ID获取分类
     */
    CategoryResponse getById(Long id);
}