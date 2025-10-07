import { useState } from "react";

export default function Contact({ contact, onDelete, onEdit }) {
    const [firstName, setFirstName] = useState(contact.firstName);
    const [lastName, setLastName] = useState(contact.lastName);
    const [phone, setPhone] = useState(contact.phone);

    function isNewContactValid() {
        return firstName && lastName && phone && phone.length >= 10 && phone.length <= 20;
    }

    return (
        <div className="contact-card">
            <div className="contact-infos">
                <input
                    type="text"
                    value={ firstName }
                    placeholder="Jane"
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
                    ((contact.firstName !== firstName || contact.lastName !== lastName || contact.phone !== phone) && isNewContactValid) && (
                        <button className="contact-edit" onClick={() => onEdit({ _id: contact._id, firstName, lastName, phone})}>Edit</button>
                    )
                }
                <button className="contact-delete" onClick={() => onDelete(contact._id)}>Delete</button>
            </div>
        </div>
    )
}