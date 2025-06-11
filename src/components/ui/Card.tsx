import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '@/theme/constants/theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  rightHeader?: React.ReactNode;
}

interface CardComponentProps extends CardProps {
  onPress?: () => void;
  activeOpacity?: number;
}

const CardComponent = ({
  style,
  onPress,
  activeOpacity,
  children,
}: CardComponentProps) => {
  const Component = onPress ? TouchableOpacity : View;

  function safeRender(children: React.ReactNode): React.ReactNode {
    if (typeof children === 'string' || typeof children === 'number') {
      return <Text>{children}</Text>;
    }
    if (Array.isArray(children)) {
      return children.map((child, i) => <React.Fragment key={i}>{safeRender(child)}</React.Fragment>);
    }
    if (React.isValidElement(children) && children.type === React.Fragment) {
      return safeRender((children as React.ReactElement<any>).props.children);
    }
    return children;
  }

  return (
    <Component style={style} onPress={onPress} activeOpacity={activeOpacity}>
      {safeRender(children)}
    </Component>
  );
};

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  headerStyle,
  bodyStyle,
  titleStyle,
  subtitleStyle,
  rightHeader,
}: CardProps) => {
  function renderCardChildren(children: React.ReactNode): React.ReactNode {
    if (typeof children === 'string' || typeof children === 'number') {
      return <Text>{children}</Text>;
    }
    if (Array.isArray(children)) {
      return children.map((child, i) => <React.Fragment key={i}>{renderCardChildren(child)}</React.Fragment>);
    }
    if (React.isValidElement(children) && children.type === React.Fragment) {
      return renderCardChildren((children as React.ReactElement<any>).props.children);
    }
    return children;
  }
  return (
    <CardComponent
      style={[styles.container, style]}
      onPress={onPress}
    >
      {title || subtitle || rightHeader ? (
        <View style={[styles.header, headerStyle]}>
          {title && (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          )}
          {rightHeader && (
            <View style={styles.rightHeader}>{rightHeader}</View>
          )}
        </View>
      ) : null}
      <View style={[styles.body, bodyStyle]}>
        {renderCardChildren(children)}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  rightHeader: {
    marginLeft: 'auto',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Halved from 12
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8, // Halved from 16
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  body: {
    padding: 8, // Halved from 16
  },
});

export default Card;