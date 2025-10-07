import "../assets/css/dashboard.css";
import { useContext, useEffect, useState } from "react";
import Contact from "../components/contact.component.jsx";
import NewContact from "../components/newContact.component.jsx";
import { AuthContext } from "../contexts/auth.context.jsx";
import { useNavigate } from "react-router-dom";
import contactService from "../services/contact.service.js";

export default function Dashboard() {
    const [contactList, setContactList] = useState([]);
    const [errors, setErrors] = useState(null);
    const [showNewContactForm, setShowNewContactForm] = useState(false);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchContacts = async () => {
            await loadContacts();
        };
        fetchContacts();
    }, []);

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    async function loadContacts() {
        setErrors(null);
        try {
            const res = await contactService.getAll();
            setContactList(res.data);
        } catch (err) {
            console.error(err);
            setErrors(err.error);
        }
    }

    async function handleContactDelete(contactId) {
        setErrors(null);
        try {
            await contactService.delete(contactId);
            setContactList(contacts => contacts.filter(c => c._id !== contactId));
        } catch (err) {
            console.error(err);
            setErrors(err.error);
        }
    }

    async function handleContactEdit(contact) {
        setErrors(null);
        try {
            await contactService.update(contact._id, contact.firstName, contact.lastName, contact.phone);
            setContactList(contacts => contacts.map(c => c._id === contact._id ? contact : c));
        } catch (err) {
            console.error(err);
            setErrors(err.error);
        }
    }

    async function handleNewContactAdd(newContact) {
        setErrors(null);
        try {
            await contactService.create(newContact.firstName, newContact.lastName, newContact.phone);
            await loadContacts();
            setShowNewContactForm(false);
        } catch (err) {
            console.error(err);
            setErrors(err.error);
        }
    }

    async function handleNewContactDelete() {
        setShowNewContactForm(false);
    }

    return (
        <>
            <header>
                <h1>My Contacts</h1>
                <button onClick={handleLogout}>Log out</button>
            </header>
            <div className="dashboard">
                {
                    errors &&
                    (
                        <div className="error-message">
                            { errors }
                        </div>
                    )
                }
                <div className="dashboard-header">
                    {
                        showNewContactForm ? (
                            <NewContact onAdd={handleNewContactAdd} onDelete={handleNewContactDelete}/>
                        ) : (
                            <button onClick={() => setShowNewContactForm(true)}>
                                + Add contact
                            </button>
                        )
                    }
                </div>
                {
                    contactList.length < 1 ? (
                        <p>No contact found</p>
                    ) : (
                        contactList.map((contact) => (
                            <Contact
                                key={contact._id}
                                contact={contact}
                                onDelete={handleContactDelete}
                                onEdit={handleContactEdit}
                            />
                        ))
                    )
                }
            </div>
        </>
    )
}