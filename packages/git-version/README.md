#abm:git-version

Meteor package which provides version information from git.

##Usage

    {{>gitVersion}}

Will render some short and sweet html containing the output of `git describe` or the string `DEV` if this was unavailable for whatever reason.

Alternatively to get the raw version use

    Meteor.call("gitVersion")