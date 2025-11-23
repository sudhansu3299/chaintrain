# bash run_trainer.sh handles everything requyired to run trainer on Nautilus

export KEY_PAIR=
export AWS_ACCESS_KEY_ID= 
export AWS_SECRET_ACCESS_KEY=
export AWS_SESSION_TOKEN=
export REGION=
export INSTANCE_ID=
export AMI_ID=

sh configure_enclave.sh trainer

: '
-- commands --

for private keys
aws configure


-- regen AWS keys:
aws sts get-session-token --duration-seconds 36000

-- aws AMI_ID
aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query "Parameters[0].Value" \
  --region eu-north-1 \   
  --output text


create key-pair
aws ec2 create-key-pair \
    --key-name my-key-pair \
    --key-type rsa \
    --key-format pem \
    --query "KeyMaterial" \
    --output text > my-key-pair.pem

instance:
tarinerrr/05535hx04nmddgc1ymvqxrm9fq
'