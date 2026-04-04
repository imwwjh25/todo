package com.todo.service;

import com.todo.dto.request.TodoCreateRequest;
import com.todo.dto.request.TodoQueryRequest;
import com.todo.dto.request.TodoUpdateRequest;
import com.todo.dto.response.PageResponse;
import com.todo.dto.response.TodoResponse;
import java.util.List;

/**
 * 任务服务接口
 */
public interface TodoService {
    /**
     * 创建任务
     */
    TodoResponse createTodo(TodoCreateRequest request);

    /**
     * 更新任务
     */
    TodoResponse updateTodo(Long id, TodoUpdateRequest request);

    /**
     * 删除任务
     */
    void deleteTodo(Long id);

    /**
     * 完成任务
     */
    TodoResponse completeTodo(Long id);

    /**
     * 根据ID获取任务
     */
    TodoResponse getById(Long id);

    /**
     * 查询任务列表
     */
    PageResponse<TodoResponse> queryTodos(TodoQueryRequest request);

    /**
     * 获取任务历史记录
     */
    List<TodoResponse> getHistory(Long id);
}