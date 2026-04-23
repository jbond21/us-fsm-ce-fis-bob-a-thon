#!/usr/bin/env python3
"""
generate-jenkins-users.py
Generates a Groovy script to create Jenkins workshop users via the
Jenkins Script Console.

Passwords are constructed as <username><base-password>, matching the
convention used by generate-htpasswd.sh. Use the same base password
for both scripts so credentials are consistent.

Usage:
    uv run generate-jenkins-users.py <num_users> --password <base_password>

Example:
    uv run generate-jenkins-users.py 20 --password Workshop2024!

Output is a ready-to-run Groovy script. Either:
  - Paste it into Jenkins > Manage Jenkins > Script Console, or
  - POST it to the Jenkins scriptText API (see INSTRUCTOR_SETUP.md Step 1i)
"""

import argparse
import sys

USER_PREFIX = "user"


def generate(num_users: int, base_password: str) -> None:
    print("import jenkins.model.*")
    print("import hudson.security.*")
    print("")
    print("def instance = Jenkins.getInstance()")
    print("def realm = instance.getSecurityRealm()")
    print("")

    for i in range(1, num_users + 1):
        username = f"{USER_PREFIX}{i}"
        password = f"{username}{base_password}"
        print(f'realm.createAccount("{username}", "{password}")')

    print("")
    print("instance.save()")
    print('println "Done — ' + str(num_users) + ' users created"')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a Groovy script to create Jenkins workshop users."
    )
    parser.add_argument(
        "num_users",
        type=int,
        help="Number of users to generate"
    )
    parser.add_argument(
        "--password",
        required=True,
        help="Base password — each user's password will be <username><password>"
    )

    args = parser.parse_args()

    if args.num_users < 1:
        print("ERROR: num_users must be a positive integer.", file=sys.stderr)
        sys.exit(1)

    generate(args.num_users, args.password)
