import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";

export function Container({
  children,
  style,
  padding = 4,
  edges = ["top", "left", "right", "bottom"],
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: edges.includes("top")
            ? Math.max(insets.top, theme.spacing[padding])
            : theme.spacing[padding],
          paddingBottom: edges.includes("bottom")
            ? Math.max(insets.bottom, theme.spacing[padding])
            : theme.spacing[padding],
          paddingLeft: edges.includes("left")
            ? Math.max(insets.left, theme.spacing[padding])
            : theme.spacing[padding],
          paddingRight: edges.includes("right")
            ? Math.max(insets.right, theme.spacing[padding])
            : theme.spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default Container;
