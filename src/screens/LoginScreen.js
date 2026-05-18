import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Container, Header, Input } from "../components";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    setErrors({});
    if (!email) {
      setErrors({ email: "El correo es requerido" });
      return;
    }
    if (!password) {
      setErrors({ password: "La contraseña es requerida" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      setErrors({ general: "Error al iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="wallet"
              size={60}
              color={theme.colors.primary[500]}
            />
          </View>
          <Header
            title="FinanzasApp"
            subtitle="Gestiona tus finanzas con confianza"
          />
        </View>

        <View style={styles.formSection}>
          {errors.general && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>¿No tienes cuenta?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Crear nueva cuenta"
            onPress={() => navigation.navigate("Register")}
            variant="outline"
            size="lg"
          />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  topSection: {
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[8],
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius["2xl"],
  },
  formSection: {
    marginBottom: theme.spacing[8],
  },
  loginButton: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing[3],
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
  },
  errorAlert: {
    backgroundColor: "#FEE2E2",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorAlertText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.medium,
  },
});
