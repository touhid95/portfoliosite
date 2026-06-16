import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Background & Text Colors
    content = content.replace('bgcolor="#ffffff"', 'bgcolor="#FCFAF2"')
    content = content.replace('text="#000000"', 'text="#2C2C2C"')
    content = content.replace('link="#000000" vlink="#000000" alink="#000000"', 'link="#2C2C2C" vlink="#2C2C2C" alink="#BC2026"')
    
    # 2. Section Dividers -> Subtle Mist (1px)
    content = content.replace('<hr color="#000000" size="1"', '<hr color="#E0E0E0" size="1"')
    content = content.replace('bordercolor="#000000"', 'bordercolor="#E0E0E0"')
    
    # 3. Kintsugi "Art Line" 
    # We replace the specific <hr> that separates the header context from the page content.
    # It appears exactly after the <font color="#888888">SUBTITLE</font> block.
    content = re.sub(
        r'(<font face="Courier New" size="2" color="#888888">.*?</font>\s*<br /><br /><br />\s*)<hr color="#E0E0E0" size="1" />',
        r'\1<hr color="#BC2026" size="2" />',
        content
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Kintsugi applied.")
