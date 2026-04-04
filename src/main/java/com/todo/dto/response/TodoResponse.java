package com.todo.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TodoResponse {
    private Long id;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String priorityName;
    private Integer priority;
    private String statusName;
    private Integer status;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}