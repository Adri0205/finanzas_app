import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Container, Header, Input } from "../components";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    setErrors({});
    if (!name) {
      setErrors({ name: "El nombre es requerido" });
      return;
    }
    if (!email) {
      setErrors({ email: "El correo es requerido" });
      return;
    }
    if (!password) {
      setErrors({ password: "La contraseña es requerida" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Las contraseñas no coinciden" });
      return;
    }
    if (password.length < 6) {
      setErrors({ password: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      setErrors({ general: "Error al crear la cuenta" });
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
              name="account-plus"
              size={60}
              color={theme.colors.secondary[500]}
            />
          </View>
          <Header title="Crear cuenta" subtitle="Únete a FinanzasApp hoy" />
        </View>

        <View style={styles.formSection}>
          {errors.general && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

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

          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Crear cuenta"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate("Login")}
            >
              Inicia sesión
            </Text>
          </View>
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
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius["2xl"],
  },
  formSection: {
    marginBottom: theme.spacing[8],
  },
  registerButton: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing[4],
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
  },
  footerLink: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
});
