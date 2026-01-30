# Ingredient Macros Research

Research and update nutritional macros for ingredients in the database.

## Usage

```
/ingredient-macros <ingredient-ref> [source]
```

**Source can be:**
- An image path (e.g., `~/Desktop/label.jpg`) - nutritional label photo
- A URL (e.g., `https://example.com/nutrition`) - webpage with nutrition info
- Nothing - triggers web search for the ingredient

## Workflow

### 1. Parse Input

Determine the input type:
- **Image**: Path ends with `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif`
- **URL**: Starts with `http://` or `https://`
- **Search**: No source provided, or just descriptive text

### 2. Research Macros

#### From Image
1. Read the image file using the Read tool
2. Extract nutritional information per 100g (convert if needed)
3. Copy image to `public/ingredients/<ref>-label.<ext>`
4. Add source reference with `image:` field

#### From URL
1. Fetch the URL using WebFetch
2. Extract nutritional information per 100g
3. Add source reference with `url:` and `label:` fields

#### From Web Search
1. Search for nutritional info using these trusted sources:
   - USDA FoodData Central (fdc.nal.usda.gov)
   - Swedish Livsmedelsverket (livsmedelsverket.se)
   - Nutritionix
   - MyFitnessPal
2. Present findings to user with source URLs
3. Ask user to confirm the values look correct
4. Only proceed after confirmation

### 3. Update Ingredient

Update `src/data/ingredients.yaml`:

```yaml
- ref: <ingredient-ref>
  name: <Ingredient Name>
  per100g:
    calories: <number>
    protein: <number>
    carbs: <number>
    fat: <number>
    fiber: <number>
  g_per_dl: <number>  # Optional, for volume measurements
  units:              # Optional, for count-based measurements
    small: <grams>
    medium: <grams>
    large: <grams>
    whole: <grams>
    # Add any relevant unit names (clove, cherry, etc.)
  sources:
    - url: https://...
      label: USDA FoodData Central
    # Or for images:
    - image: /ingredients/<ref>-label.jpg
```

### Unit Conversions

For ingredients commonly measured by count (eggs, tomatoes, garlic, etc.), add a `units` map with gram weights for each size/type. This allows recipes to use `unit: medium` without specifying `grams_per_unit` each time.

Examples:
```yaml
# Eggs
units:
  small: 40
  medium: 50
  large: 60

# Tomatoes
units:
  cherry: 15
  roma: 60
  medium: 150
  large: 180

# Garlic
units:
  clove: 4
  cloves: 4
  head: 50
```

### 4. Conversion Rules

- Always store values **per 100g**
- If source shows per serving, calculate per 100g: `(value / serving_size_g) * 100`
- Round to reasonable precision:
  - Calories: whole numbers
  - Protein/carbs/fat/fiber: 1 decimal place

### 5. Confirm Changes

After updating, show the user:
1. The ingredient entry that was added/updated
2. The sources referenced
3. Run `bun run build` to verify no errors

## Examples

```
# From nutrition label image
/ingredient-macros oat-milk ~/Downloads/oatly-label.jpg

# From URL
/ingredient-macros greek-yogurt https://fdc.nal.usda.gov/fdc-app.html#/food-details/170903/nutrients

# Web search (will ask for confirmation)
/ingredient-macros almond-butter

# With description for better search
/ingredient-macros whey-protein "unflavored whey protein isolate"
```
