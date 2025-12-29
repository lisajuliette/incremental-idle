# Tailwind CSS Setup

This app uses **NativeWind** (Tailwind CSS for React Native) for all styling.

## Theme System

All colors are centralized in `src/theme/colors.js` for easy reskinning. To change the app's color scheme, simply update the theme file.

### Changing Colors

Edit `src/theme/colors.js` to change any color:

```javascript
export const theme = {
	background: {
		primary: 'bg-purple-100', // Change to any Tailwind color
		// ...
	},
	// ...
};
```

### Using Theme Colors

Import and use theme colors in components:

```javascript
import { theme } from '../theme/colors';

<View className={theme.background.primary}>
	<Text className={theme.text.primary}>Hello</Text>
</View>;
```

## Styling Guidelines

- **Always use Tailwind classes** - No StyleSheet.create() or inline styles
- **Use theme colors** - Import from `src/theme/colors.js` for consistency
- **Use className prop** - NativeWind uses `className` instead of `style`
- **Combine classes** - Use template literals for conditional classes

## Example

```javascript
<View className={`${theme.background.primary} p-4`}>
	<Text className={`${theme.text.primary} text-lg font-mono`}>Hello World</Text>
</View>
```

## Available Tailwind Classes

All standard Tailwind utility classes are available:

- Layout: `flex`, `flex-row`, `items-center`, `justify-between`, etc.
- Spacing: `p-4`, `m-2`, `gap-2`, etc.
- Colors: Use theme colors or Tailwind color classes
- Typography: `text-sm`, `font-bold`, `font-mono`, etc.
- Borders: `border`, `border-2`, `rounded`, etc.

## Reskinning the App

To completely reskin the app:

1. Open `src/theme/colors.js`
2. Replace Tailwind color classes with your desired colors
3. All components will automatically update

Example: Change from purple theme to green theme:

```javascript
background: {
  primary: 'bg-green-100',  // Changed from bg-purple-100
}
```
