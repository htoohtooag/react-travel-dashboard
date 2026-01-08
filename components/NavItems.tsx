import { Link, NavLink, useLoaderData, useNavigate } from "react-router"
import { sidebarItems } from "~/constants"
import { cn } from "../app/lib/utils"
import { logoutUser } from "~/appwrite/auth"

interface NavItemsProps {
  handleClick?: () => void
}
const NavItems = ({ handleClick }: NavItemsProps) => {
  
  //?=> useLoaderData() always reads data from the nearest parent route loader
  const user = useLoaderData(); // we run the function nearest route clientLoadr (we use that navitems in admin so adminlyaout client-loader will run)
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser(); 
    navigate("/sign-in")
  }


  return (
    <section className="nav-items">
      <Link to={"/"} className="link-logo">
        <img src="/assets/icons/logo.svg" alt="logo" />
        <h1>Tourvisto</h1>
      </Link>
      <div className="container">
        <nav>
          {sidebarItems.map(({ id, href, icon, label }) => (
            <NavLink to={href} key={id}>
              {({ isActive, isPending }: { isActive: boolean, isPending: boolean }) => (
                <div className={cn("group nav-item", {
                  'bg-primary-100 !text-white': isActive
                })}
                onClick={handleClick}
              >
                  <img src={icon} alt={label} className={`group-hover:brightness-0 size-0 lg:size-5 group-hover:invert ${isActive ? 'brightness-0 invert' : 'text-dark-200'}`} />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <footer className="nav-footer">
          {/* if not google image url is exit and not shown add referrerPolicy="no-referrer" */}
          <img src={user?.imageUrl || "/assets/images/david.webp"} alt="user" referrerPolicy="no-referrer" />
          <article>
            <h2>{user?.name}</h2>
            <h2>{user?.email}</h2>
          </article>
          <button className="cursor-pointer" onClick={handleLogout}>
            <img src="/assets/icons/logout.svg" alt="logo" className="size-6" />
          </button>
        </footer>
      </div>
    </section>
  )
}

export default NavItems


// {"bg-pari": boolean } => clsx syntax (then we combime with)