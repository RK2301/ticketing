import Link from 'next/link'

const Header = ({ currentUser }) => {

    const links = [
        !currentUser && { label: 'Sign Up', href: '/auth/signup' },
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        currentUser && { label: 'Sell Ticket', href: '/tickets/new' },
        currentUser && { label: 'My Orders', href: '/orders' },
        currentUser && { label: 'Sign Out', href: '/auth/signout' }
    ]
        .filter(link => link)
        .map(({ label, href }) => (
            <li key={label} className='nav-item' >
                <Link href={href} className='nav-link' style={{ color: label != 'Sign Out' ? '#E0E7FF' : 'red' }}> {label} </Link>
            </li>
        ))
    return (
        <nav className="navbar p-1" style={{ backgroundColor: '#1E3A8A' }}>
            <div className='container-fluid'>
                <Link className="navbar-brand" href="/" style={{ color: '#E0E7FF' }}>
                    <h4> GitTix </h4>
                </Link>
                <div className='d-flex justify-content-end'>
                    <ul className='nav d-flex align-items-center'>
                        {links}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Header