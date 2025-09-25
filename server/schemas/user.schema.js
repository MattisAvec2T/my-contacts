 const baseSchema = {
    email: {
        exists: {
            errorMessage: "Email is required",
        },
        notEmpty: {
            errorMessage: "Email is required",
        },
        isEmail: {
            errorMessage: "Email is not valid",
        },
        normalizeEmail: true,
        escape: true,
        matches: {
            options: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: "Email must be a valid format",
        },
    },
    password: {
        exists: {
            errorMessage: "Password is required",
        },
        isLength: {
            options: { min: 8 },
            errorMessage: "Password must be at least 8 characters long",
        },
    },
};

export const registerSchema = {
    ...baseSchema,
    confirmPassword: {
        exists: {
            errorMessage: "Password confirmation is required",
        },
        isLength: {
            options: { min: 8 },
            errorMessage: "Password confirmation must be at least 8 characters long",
        },
        custom: {
            options: (value, { req }) => {
                return value === req.body.password;
            },
            errorMessage: "Passwords do not match",
        },
    },
}

export const loginSchema = baseSchema;