package com.todo.controller;

import com.todo.common.result.Result;
import com.todo.dto.request.CategoryCreateRequest;
import com.todo.dto.request.CategoryUpdateRequest;
import com.todo.dto.response.CategoryResponse;
import com.todo.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public Result<CategoryResponse> create(@Valid @RequestBody CategoryCreateRequest request) {
        return Result.success(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public Result<CategoryResponse> update(@PathVariable Long id, @Valid @RequestBody CategoryUpdateRequest request) {
        return Result.success(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping
    public Result<List<CategoryResponse>> getAll() {
        return Result.success(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public Result<CategoryResponse> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }
}