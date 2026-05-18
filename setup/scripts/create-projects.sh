#!/bin/bash
set -e

# ── Edit these before running ──────────────────────────────────────────
USERS=(user1 user2 user3 user4 user5
       user6 user7 user8 user9 user10
       user11 user12 user13 user14 user15
       user16 user17 user18 user19 user20
       user21 user22 user23 user24 user25
       user26 user27 user28 user29 user30
       user31 user32 user33 user34 user35
       user36 user37 user38 user39 user40
       user41 user42 user43 user44 user45)

JENKINS_NS='jenkins'
# ───────────────────────────────────────────────────────────────────────

for USER in "${USERS[@]}"; do
  NS="${USER}-dev"
  echo ""
  echo "=== Provisioning: ${USER} -> ${NS} ==="

  # 1. Create namespace
  oc new-project ${NS} \
    --description="Workshop namespace for ${USER}" \
    --display-name="${USER} - Workshop" || true

  # 2. Grant Jenkins SA deploy rights in this namespace
  oc adm policy add-role-to-user edit \
    system:serviceaccount:${JENKINS_NS}:jenkins -n ${NS}

  # 3. Allow agent pods to pull the bob-cli image from the jenkins namespace
  oc policy add-role-to-user system:image-puller \
    system:serviceaccount:${NS}:default -n ${JENKINS_NS}

  echo "  Namespace : ${NS}"
  echo "  OK"
done

echo ""
echo "All users provisioned."