import csv
import collections

# field names
fields = ['input_string', 'lewd', 'offensive', 'intent', 'group', 'implication']

# data rows of text file
rows = []
group_dict = collections.defaultdict(lambda: 0)
total_group = 0
count = [0, 0, 0, 0]
non_abusive_count = 0
# name of text and csv file
in_file = "data/sent_predict.txt"
out_file = "data/sent_predict.csv"

# read rows of input file
with open(in_file, 'r', encoding='utf-8') as textfile:
    lines = textfile.readlines()
    print(len(lines))
    for line in lines:
        seg = line.split("[SEP]")
        input_string = seg[0][6:-1]
        lewd, offensive, intent, group, implication = seg[1][5], seg[1][12], seg[1][19], seg[1][29:-1].lower(), seg[2][1:-1]
        if len(group) >= 20:
            group = "other"
        if group == "indians":
            group = "indian folks"
        if len(group) > 5 and group[-5:] == "folks":
            group = group[0:-5]
        rows.append([input_string, lewd, offensive, intent, group, implication])
        group_dict[group] += 1
        if lewd == "Y":
            count[0] += 1
        if offensive == "Y":
            count[1] += 1
        if intent == "Y":
            count[2] += 1
        if group != "nan":
            count[3] += 1
        if lewd == "N" and offensive == "N" and intent == "N":
            non_abusive_count += 1


print(group_dict.keys())
# print(len(temp_dict.keys()))
# print([len(temp_dict[key]) for key in temp_dict.keys()])
print("total ", len(rows))
print(count, non_abusive_count)
print(non_abusive_count / len(rows))
print([[key, group_dict[key]/count[3]] for key in group_dict.keys()])


# # writing to csv file
with open(out_file, 'w', newline='', encoding='utf-8') as csvfile:
    # creating a csv writer object
    csvwriter = csv.writer(csvfile)

    # writing the fields
    csvwriter.writerow(fields)

    # writing the data rows
    csvwriter.writerows(rows)

print("done!")
