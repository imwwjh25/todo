package com.todo.common.enums;

import lombok.Getter;

@Getter
public enum Status {
    PENDING(0, "待办"),
    COMPLETED(1, "已完成");

    private final int code;
    private final String name;

    Status(int code, String name) {
        this.code = code;
        this.name = name;
    }

    public static Status fromCode(int code) {
        for (Status s : values()) {
            if (s.code == code) {
                return s;
            }
        }
        return PENDING;
    }
}