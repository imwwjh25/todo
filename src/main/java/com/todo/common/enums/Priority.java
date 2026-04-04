package com.todo.common.enums;

import lombok.Getter;

@Getter
public enum Priority {
    LOW(0, "低"),
    MEDIUM(1, "中"),
    HIGH(2, "高");

    private final int code;
    private final String name;

    Priority(int code, String name) {
        this.code = code;
        this.name = name;
    }

    public static Priority fromCode(int code) {
        for (Priority p : values()) {
            if (p.code == code) {
                return p;
            }
        }
        return MEDIUM;
    }
}