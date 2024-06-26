#! /usr/bin/env python3

import os
from shutil import make_archive

def move_to_script_dir():
    os.chdir(f'{os.path.dirname(__file__)}')

def main():
    src_dir = f'{os.path.dirname(__file__)}/src'
    move_to_script_dir()
    make_archive('extension', 'zip', root_dir=src_dir, base_dir=None)
    os.rename('extension.zip', 'extension.xpi')

if __name__ == '__main__':
    main()