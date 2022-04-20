import csv
import collections

# field names
fields = ['input_string', 'lewd', 'offensive', 'intent', 'group', 'implication']

# data rows of text file
rows = []
temp_dict = collections.defaultdict(list)
count = [0, 0, 0, 0]

# name of text and csv file
in_file = "data/founta_predict.txt"
out_file = "data/founta_predict.csv"

# read rows of input file
with open(in_file, 'r', encoding='utf-8') as textfile:
    lines = textfile.readlines()
    print(len(lines))
    for line in lines:
        seg = line.split("[SEP]")
        input_string = seg[0][6:-1]
        lewd, offensive, intent, group, implication = seg[1][5], seg[1][12], seg[1][19], seg[1][29:-1], seg[2][1:-1]
        rows.append([input_string, lewd, offensive, intent, group, implication])
        temp_dict[lewd+offensive+intent+group+implication].append(input_string)
        if lewd == "Y":
            count[0] += 1
        if offensive == "Y":
            count[1] += 1
        if intent == "Y":
            count[2] += 1
        if group == "Y":
            count[3] += 1


print(temp_dict.keys())
print([len(temp_dict[key]) for key in temp_dict.keys()])
print(count)

# # writing to csv file
with open(out_file, 'w', newline='', encoding='utf-8') as csvfile:
    # creating a csv writer object
    csvwriter = csv.writer(csvfile)

    # writing the fields
    csvwriter.writerow(fields)

    # writing the data rows
    csvwriter.writerows(rows)
