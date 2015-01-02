#!/bin/sh

#pull the official TLD list, remove comments and blanks, reverse each line, then sort
words=`curl -# https://www.publicsuffix.org/list/effective_tld_names.dat |
	grep "^[a-z]" |
	grep -v "blogspot" |
	rev |
	sort`

#convert each line into Go strings
strings=`for w in $words; do
	echo "	\"$w\","
done`

#output the generated file
echo "package tld
//generated on '`date -u`'

//list contains all TLDs reversed, then sorted
var list = []string{
$strings
}

var count = len(list)
" > parse_list.go
