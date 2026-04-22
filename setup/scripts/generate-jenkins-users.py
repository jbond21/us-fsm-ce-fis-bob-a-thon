#!/usr/bin/env python3
"""
generate-jenkins-users.py
Generates a JCasC users block for pasting into jenkins-values.yaml.

Passwords are constructed as <username><base-password>, matching the
convention used by generate-htpasswd.sh. Use the same base password
for both scripts so OpenShift and Jenkins credentials are consistent.

Usage:
    uv run generate-jenkins-users.py <num_users> --password <base_password>

Example:
    uv run generate-jenkins-users.py 20 --password Workshop2024!

Output is printed to stdout. Paste it into jenkins-values.yaml replacing
the existing users block under the 'users:' key.

INDENTATION NOTE:
  The output uses 16 spaces for '- id:' and 18 spaces for 'password:'.
  This matches the required indentation inside the JCasC configScripts
  block in jenkins-values.yaml. Do not adjust the indentation when pasting.
"""

import argparse
import sys

USER_PREFIX = "user"

# 16 spaces — aligns '- id:' under 'users:' inside the JCasC configScripts block
ID_INDENT  = " " * 16
# 18 spaces — aligns 'password:' under '- id:'
PW_INDENT  = " " * 18


def generate(num_users: int, base_password: str) -> None:
    for i in range(1, num_users + 1):
        username = f"{USER_PREFIX}{i}"
        password = f"{username}{base_password}"
        print(f"{ID_INDENT}- id: \"{username}\"")
        print(f"{PW_INDENT}password: \"{password}\"")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a JCasC users block for jenkins-values.yaml."
    )
    parser.add_argument(
        "num_users",
        type=int,
        help="Number of users to generate (must match the count used for OpenShift)"
    )
    parser.add_argument(
        "--password",
        required=True,
        help="Base password — must match the --password used with generate-htpasswd.sh"
    )

    args = parser.parse_args()

    if args.num_users < 1:
        print("ERROR: num_users must be a positive integer.", file=sys.stderr)
        sys.exit(1)

    generate(args.num_users, args.password)
