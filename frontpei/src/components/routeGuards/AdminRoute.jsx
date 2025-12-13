export default function AdminRoute({ children }) {
  const { usuario } = useContext(AuthContext);

  if (usuario?.tipo_usuario !== "ADMIN") {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
}
