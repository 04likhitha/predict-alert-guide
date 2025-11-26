import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CustomNavLinkProps extends NavLinkProps {
  activeClassName?: string;
}

export const NavLink = ({ className, activeClassName, ...props }: CustomNavLinkProps) => {
  return (
    <RouterNavLink
      className={(renderProps) =>
        cn(
          typeof className === "function" ? className(renderProps) : className,
          renderProps.isActive && activeClassName
        )
      }
      {...props}
    />
  );
};
