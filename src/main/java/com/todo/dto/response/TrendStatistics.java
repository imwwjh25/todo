package com.todo.dto.response;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class TrendStatistics {
    private String period;
    private List<Map<String, Object>> data;
}