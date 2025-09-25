import bcrypt from "bcrypt";

export async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (err) {
        throw err;
    }
}

export async function comparePassword(password, hashedPassword) {
    await bcrypt.compare(password, hashedPassword), (err, _) => {
        if (err) throw err;
    }
}