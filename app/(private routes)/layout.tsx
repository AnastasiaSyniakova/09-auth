interface PrivateLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function PrivateLayout({ children, modal }: PrivateLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
