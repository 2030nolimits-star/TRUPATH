export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="md:ml-64 ml-0 border-t border-border bg-background py-6 text-center">
      <p className="text-sm text-muted-foreground">
        © {currentYear} TRUPATH. All rights reserved. | Created by Trushi Patel
      </p>
    </footer>
  )
}
