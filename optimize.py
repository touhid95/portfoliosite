import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Add text="#000000" to body so we can drop font colors
    if 'text="#000000"' not in content:
        content = content.replace('<body bgcolor="#ffffff"', '<body bgcolor="#ffffff" text="#000000"')
    
    # 2. Shorten the massively long font face attributes
    content = content.replace('face="Georgia, Times New Roman, serif"', 'face="Georgia"')
    content = content.replace('face="Courier New, Courier, monospace"', 'face="Courier New"')
    
    # 3. Drop color="#000000" ONLY from <font> tags! (Keep it in <hr>!)
    content = re.sub(r'(<font[^>]*) color="#000000"', r'\1', content)
    
    # 4. Remove HTML comments cleanly
    content = re.sub(r'<!--.*?-->\s*', '', content, flags=re.DOTALL)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Codebase optimized successfully.")
