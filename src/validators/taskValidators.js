export const validStatuses = ["pending", "in-progress", "completed"];

export function validateDate(due_date) {
    if (due_date == null) {
        due_date = null;
    } else {
        if (typeof due_date === "string") {
            if (/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
                const [year, month, day] = due_date.split("-").map(Number);
                const date = new Date(year, month - 1, day);

                if (date.getFullYear() !== year) {
                    return {
                        valid: false,
                        message: "Invalid year in date.",
                    };
                } else if (date.getMonth() + 1 !== month) {
                    return {
                        valid: false,
                        message: "Invalid month in date.",
                    };
                } else if (date.getDate() !== day) {
                    return {
                        valid: false,
                        message: "Invalid day in date.",
                    };
                }
            } else {
                return {
                    valid: false,
                    message: "Invalid date format.",
                };
            }
        } else {
            return {
                valid: false,
                message: "Invalid date type, must be string.",
            };
        }
    }
    return {
        valid: true,
        value: due_date,
    };
}

export function validateID(task_id) {
    const id = Number(task_id);

    if (!task_id || !Number.isSafeInteger(id)) {
        return {
            valid: false,
            message: "Invalid task ID.",
        };
    }

    if (id <= 0) {
        return {
            valid: false,
            message: "Invalid value of ID, must be positive.",
        };
    }
    return {
        valid: true,
        value: id,
    };
}
