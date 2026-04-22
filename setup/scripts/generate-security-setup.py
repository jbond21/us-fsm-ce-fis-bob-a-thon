#!/usr/bin/env python3
"""
generate-security-setup.py
Generates a Groovy script to enable Jenkins security and create the admin
account. Paste the output into Manage Jenkins > Script Console and click Run.

This is run ONCE immediately after Jenkins starts unsecured following a
fresh install. After running, Jenkins will require login.

Usage:
    uv run generate-security-setup.py --password <admin-password>

Example:
    uv run generate-security-setup.py --password MyAdminPass123!

The admin password should be the auto-generated value from the Kubernetes
Secret:
    oc get secret jenkins -n jenkins \\
      -o jsonpath='{.data.jenkins-admin-password}' | base64 -d
"""

import argparse
import sys


def generate(admin_password: str) -> None:
    print("import jenkins.model.*")
    print("import hudson.security.*")
    print("")
    print("def instance = Jenkins.getInstance()")
    print("def realm = new HudsonPrivateSecurityRealm(false)")
    print(f'realm.createAccount("admin", "{admin_password}")')
    print("instance.setSecurityRealm(realm)")
    print("")
    print("def strategy = new FullControlOnceLoggedInAuthorizationStrategy()")
    print("strategy.setAllowAnonymousRead(false)")
    print("instance.setAuthorizationStrategy(strategy)")
    print("")
    print("instance.save()")
    print('println "Security configured"')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a Groovy script to enable Jenkins security."
    )
    parser.add_argument(
        "--password",
        required=True,
        help="Admin password (retrieve from: oc get secret jenkins -n jenkins "
             "-o jsonpath='{.data.jenkins-admin-password}' | base64 -d)"
    )

    args = parser.parse_args()

    if not args.password:
        print("ERROR: password must not be empty.", file=sys.stderr)
        sys.exit(1)

    generate(args.password)
