package com.todo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryUpdateRequest {
    @Size(max = 50, message = "分类名称最多50字符")
    private String name;

    private Integer sortOrder;
}