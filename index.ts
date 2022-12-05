import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const role = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal)
});

const fn = new aws.lambda.Function("fn", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    role: role.arn,
    runtime: "nodejs18.x",
    handler: "index.handler"
});

const lambdapermission = new aws.lambda.Permission("lambdaPermission", {
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    function: fn,
  });

const api = new aws.apigatewayv2.Api("api", {
    protocolType: "HTTP",
    routeKey: "GET /",
    target: fn.invokeArn
});

export const url = api.apiEndpoint;