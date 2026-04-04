package com.todo.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TodoQueryRequest {
    private String keyword;
    private Long categoryId;
    private Integer priority;
    private Integer status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer page = 0;
    private Integer size = 20;
}