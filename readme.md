


# dk-csv-to-jira

A lightweight Python script to transform a Google Sheets-exported CSV file into a Jira-compatible story import format.

## Features

- Filters rows by phase number (1–10)
- Renames and maps columns based on a configurable YAML scheme
- Concatenates multiple fields into the Jira "Description" column
- Appends static text to descriptions
- Adds fixed columns like `Issue Type`, `Status`, and `Epic Link` using the YAML config
- Outputs a cleaned CSV to your `~/Downloads` folder

## Setup

1. Make sure Python 3 is installed.
2. Clone this repo and navigate into it.
3. Place your CSV file (exported from Google Sheets) in the project directory.
4. Edit the `scheme.yaml` to fit your needs.

## Running the script

```bash
python3 csv-to-jira-story.py
```

You'll be prompted to:

- Enter the path to your input CSV
- Choose a phase number (1–10)

The script processes the file and saves the result as:

```
~/Downloads/jira-import.csv
```

## YAML Configuration (`scheme.yaml`)

Here’s an example:

```yaml
rename:
  Component: Summary
  Pages: Labels
  Impl Est: Story Points
  Design: Description
  Prototype: Description
  Category: Description

append_to_description:
  - Design
  - Prototype
  - Category

append_multiline: |
  ----
  Please ensure this story is reviewed before the sprint.
  Link related design artifacts and tickets here.

add:
  Issue Type: Story
  Status: Planning Web
  Epic Link: DDS-1
```

## License

MIT