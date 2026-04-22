#!/usr/bin/env python3
"""
generate-htpasswd.py
Generates a bcrypt htpasswd file for workshop users.

Each user's password is: <username><base_password>
e.g. for base password 'Workshop2024!' -> user01Workshop2024!

Invoked via generate-htpasswd.sh, which handles virtualenv checks.
Can also be run directly:
    uv run generate-htpasswd.py <num_users> --password <password>
"""

import sys
import argparse
import bcrypt

OUTPUT_FILE = "workshop-users.htpasswd"
USER_PREFIX = "user"


def generate(num_users: int, base_password: str) -> None:
    entries = []

    for i in range(1, num_users + 1):
        username = f"{USER_PREFIX}{i:02d}"
        password = f"{username}{base_password}"
        hashed   = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10))
        entries.append(f"{username}:{hashed.decode('utf-8')}")
        print(f"  ✓  {username}  (password: {password})")

    with open(OUTPUT_FILE, "w") as f:
        f.write("\n".join(entries) + "\n")

    print(f"\nWritten {len(entries)} entries to: {OUTPUT_FILE}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a bcrypt htpasswd file for workshop users."
    )
    parser.add_argument(
        "num_users",
        type=int,
        help="Number of users to generate (e.g. 20)"
    )
    parser.add_argument(
        "--password",
        required=True,
        help="Base password — each user's password will be <username><password>"
    )

    args = parser.parse_args()

    if args.num_users < 1:
        print("ERROR: num_users must be a positive integer.")
        sys.exit(1)

    generate(args.num_users, args.password)
