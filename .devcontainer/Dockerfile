# Creates development machine inside docker
# so every developer will have the same environment

# registry.fedoraproject.org/fedora:43
FROM registry.fedoraproject.org/fedora@sha256:56afdee8e93ec4573788268997af39f6e821452b67c49c518e4e3175cb6e1fe7

RUN dnf install -yq micro git tig psmisc procps-ng awk openssh-server iputils \
    && dnf clean all \
    && rm -rf /var/cache/dnf \
    && mkdir -p /var/run/sshd \
    && ssh-keygen -A

RUN curl -fsSL https://opencode.ai/install | bash
RUN curl -fsSL https://nodejs.org/dist/v24.13.0/node-v24.13.0-linux-x64.tar.xz --fail --show-error --location --silent --output /tmp/node.tar.xz
RUN tar -xf /tmp/node.tar.xz -C /usr/local --remove-files --strip-components=1 \
    --exclude='*.md' --exclude='LICENSE' \
    --exclude='share' --exclude='lib/node_modules/' --exclude='bin/corepack'
RUN rm /tmp/node.tar.xz

RUN curl https://github.com/pnpm/pnpm/releases/download/v10.28.2/pnpm-linux-x64 --fail --show-error --location --silent --output /usr/local/bin/pnpm
RUN chmod a+rx /usr/local/bin/pnpm
RUN dnf install -y https://github.com/PowerShell/PowerShell/releases/download/v7.5.1/powershell-7.5.1-1.rh.x86_64.rpm

RUN mkdir -p /home/developer/.local/share/pnpm/store \
    && pnpm config set store-dir /home/developer/.local/share/pnpm/store
