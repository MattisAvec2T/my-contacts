export const newContactSchema = {
    firstName: {
        exists: {
            errorMessage: "Name is required",
        },
        notEmpty: {
            errorMessage: "Name is required",
        },
    },
    lastName: {
        exists: {
            errorMessage: "Name is required",
        },
        notEmpty: {
            errorMessage: "Name is required",
        },
    },
    phone: {
        exists: {
            errorMessage: "Phone number required",
        },
        notEmpty: {
            errorMessage: "Phone number required",
        },
        isLength: {
            options: { min: 10, max: 20 },
            errorMessage: "Phone number must be between 10 and 20 characters long",
        },
    },
};

export const updateContactSchema = {
    firstName: {
        optional: true,
        notEmpty: {
            errorMessage: "Name is required",
        },
    },
    lastName: {
        optional: true,
        notEmpty: {
            errorMessage: "Name is required",
        },
    },
    phone: {
        optional: true,
        notEmpty: {
            errorMessage: "Phone number required",
        },
        isLength: {
            options: { min: 10, max: 20 },
            errorMessage: "Phone number must be between 10 and 20 characters long",
        },
    },
};