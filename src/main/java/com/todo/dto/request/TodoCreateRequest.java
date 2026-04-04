package com.todo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TodoCreateRequest {
    @NotBlank(message = "任务标题不能为空")
    @Size(max = 200, message = "任务标题最多200字符")
    private String title;

    @Size(max = 2000, message = "任务描述最多2000字符")
    private String description;

    private Long categoryId;

    private Integer priority;

    private String dueDate;
}