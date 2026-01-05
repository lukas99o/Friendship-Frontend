export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-light text-center py-3" style={{ borderTop: '2px solid #f7931e' }}>
            <div className="container">
                <p className="mb-1"><strong>Friendship App</strong> - A social networking platform for events</p>
                <p className="mb-1">
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/lukas99o/friendship-frontend" className="text-light me-3">GitHub</a>
                    <a target="_blank" rel="noopener noreferrer" href="mailto:lukas99o@hotmail.com" className="text-light me-3">Contact</a>
                    <a target="_blank" rel="noopener noreferrer" href="http://www.lukas99o.com" className="text-light">Portfolio</a>
                </p>
                <p className="mb-0">&copy; {currentYear} Friendship App. All rights reserved.</p>
            </div>
        </footer>
    );
}
