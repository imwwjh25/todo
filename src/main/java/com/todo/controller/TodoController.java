package com.todo.controller;

import com.todo.common.result.Result;
import com.todo.dto.request.TodoCreateRequest;
import com.todo.dto.request.TodoQueryRequest;
import com.todo.dto.request.TodoUpdateRequest;
import com.todo.dto.response.PageResponse;
import com.todo.dto.response.TodoResponse;
import com.todo.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/todo-items")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @PostMapping
    public Result<TodoResponse> create(@Valid @RequestBody TodoCreateRequest request) {
        return Result.success(todoService.createTodo(request));
    }

    @PutMapping("/{id}")
    public Result<TodoResponse> update(@PathVariable Long id, @Valid @RequestBody TodoUpdateRequest request) {
        return Result.success(todoService.updateTodo(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return Result.success();
    }

    @PutMapping("/{id}/complete")
    public Result<TodoResponse> complete(@PathVariable Long id) {
        return Result.success(todoService.completeTodo(id));
    }

    @GetMapping("/{id}")
    public Result<TodoResponse> getById(@PathVariable Long id) {
        return Result.success(todoService.getById(id));
    }

    @GetMapping("/{id}/history")
    public Result<List<TodoResponse>> getHistory(@PathVariable Long id) {
        return Result.success(todoService.getHistory(id));
    }

    @GetMapping
    public Result<PageResponse<TodoResponse>> query(TodoQueryRequest request) {
        return Result.success(todoService.queryTodos(request));
    }
}