import csv
import os
import sys
import yaml

def prompt_phase():
    while True:
        phase_input = input("Enter Phase Number (1-10): ").strip()
        if phase_input.isdigit() and 1 <= int(phase_input) <= 10:
            return phase_input
        print("Invalid input. Please enter a number from 1 to 10.")

def load_scheme(path):
    with open(path, 'r') as f:
        return yaml.safe_load(f)

def process_csv(input_csv, phase_number, scheme):
    with open(input_csv, newline='') as infile:
        reader = csv.DictReader(infile)
        filtered_rows = [row for row in reader if row.get("Phase", "").strip() == phase_number]

    # Determine Epic Link based on phase number
    epic_link = "DDS-1" if phase_number == "1" else "DDS-276" if phase_number == "2" else scheme.get("add", {}).get("Epic Link", "DDS-1")

    processed = []
    for row in filtered_rows:
        new_row = {}
        for old_col, new_col in scheme['rename'].items():
            if new_col == "Description":
                continue
            new_row[new_col] = row.get(old_col, "")

        # Add static fields from 'add'
        for col, val in scheme.get("add", {}).items():
            new_row[col] = val

        # Override Epic Link based on phase number
        new_row["Epic Link"] = epic_link

        # Compose Description
        description_parts = []
        for col in scheme['append_to_description']:
            if col in row:
                description_parts.append(f"{col}: {row.get(col, '')}")
        description_parts.append(scheme['append_multiline'])
        new_row["Description"] = "\n".join(description_parts)
        processed.append(new_row)

    # First, modify original rows with 🌐 in Summary
    modified_rows = []
    for row in processed:
        row["Summary"] = f"{row['Summary']} 🌐"
        modified_rows.append(row)

    # Then, duplicate each row, replacing 🌐 with 📱 and Status with "Planning App"
    for row in modified_rows[:]:  # use a shallow copy for iteration
        new_row = row.copy()
        new_row["Summary"] = new_row["Summary"].replace("🌐", "📱")
        new_row["Status"] = "Planning App"
        modified_rows.append(new_row)

    processed = modified_rows

    # Ensure output headers include phase_column and Status
    headers = list(processed[0].keys()) if processed else []
    if "Status" not in headers:
        headers.append("Status")
    return processed, headers

def write_output_csv(data, headers, output_path):
    with open(output_path, 'w', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)

def main():
    input_csv = os.path.expanduser("~/Downloads/dds.csv")
    if not os.path.isfile(input_csv):
        print(f"File not found: {input_csv}")
        sys.exit(1)

    phase_number = prompt_phase()
    scheme = load_scheme("scheme.yaml")
    processed_rows, headers = process_csv(input_csv, phase_number, scheme)

    if not processed_rows:
        print("No matching rows found.")
        sys.exit(0)

    output_path = os.path.expanduser("~/Downloads/jira-import.csv")
    write_output_csv(processed_rows, headers, output_path)
    print("✅ CSV processed and saved as jira-import.csv")

if __name__ == "__main__":
    main()