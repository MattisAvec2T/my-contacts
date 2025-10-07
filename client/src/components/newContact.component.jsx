import { useState } from "react";

export default function NewContact({ onAdd, onDelete }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    function isNewContactValid() {
        return firstName && lastName && phone && phone.length >= 10 && phone.length <= 20;
    }

    return (
        <div className="contact-card">
            <div className="contact-infos">
                <input
                    type="text"
                    value={ firstName }
                    placeholder="John"
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    value={ lastName }
                    placeholder="Doe"
                    onChange={(e) => setLastName(e.target.value)}
                />
                <input
                    type="text"
                    value={ phone }
                    placeholder="0612345678"
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
            <div className="contact-buttons">
                {
                    isNewContactValid && (
                        <button className="contact-add" onClick={() => onAdd({ firstName, lastName, phone})}>Add</button>
                    )
                }
                <button className="contact-delete" onClick={() => onDelete()}>Delete</button>
            </div>
        </div>
    )
}