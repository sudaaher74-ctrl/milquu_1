import re

with open('frontend/admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <table class="data-table"> with <div class="table-responsive">\n<table class="data-table">
# And the corresponding </table> with </table>\n</div>

# We can find all the tables and their matching closing tags
# Using regex for nested HTML could be tricky but our tables don't have nested tables inside them.

def wrap_tables(html):
    # Find all table start and end tags
    new_html = re.sub(r'(<table class="data-table"[^>]*>)', r'<div class="table-responsive">\n            \1', html)
    new_html = re.sub(r'(</table>)', r'\1\n          </div>', new_html)
    return new_html

content = wrap_tables(content)

with open('frontend/admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Wrapped tables")

