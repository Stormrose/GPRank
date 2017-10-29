var qtnexceptions = {

};

var topiclabels = [ "Movies", "Events", "Politicians", "Places", "Bio", "Books" ];

var qtnraw = [

[ // Movies
  [ "budget", "How much did $l cost to make?" ],
  [ "country", "In which country was $l made?" ],
  [ "cinematography", "Who was the cinematographer for $l?" ],
  [ ["director","directed by"], "Who directed the film $l?" ],
  [ "distributor", "Who distributes the movie $l?" ],
  [ "editing", "Who edited the movie $l?" ],
  [ "gross", "How much money did the film $l gross?" ],
  [ "language", "What language is $l in?" ],
  [ "music", "Who composed the soundtrack for $l?" ],
  [ "producer", "Who was the producer of $l?" ],
  [ "released", "When was $l released?" ],
  [ "runtime", "How long is the movie $l?" ],
  [ "starring", "Who starred in $l?" ],
  [ "studio", "Which studio released $l?" ], 
  [ ["screenplay", "story", "writer"], "Who wrote the script for $l?" ],
],


[ // Historical Events
  [ "combatant", "Who were the sides at $l?" ],
  [ "commander", "Who were the leaders at $l?" ],
  [ ["date", "date Signed"], "When was $l?" ],
  [ "partOf", "To what larger event did $l belong?" ],
  [ "place", "What is the name of the location where $l occurred?" ],
  [ ["point","geometry"], "What are the map coordinates where $l occurred?" ],
  [ ["latitude","point","geometry"], "At what latitude did $l occur?" ],
  [ ["longitude","point","geometry"], "At what longitude did $l occur?" ],
  [ "result", "What was the outcome of the $l?" ],
  [ "cause", "What caused $l?" ],
  [ ["place","location"], "What is the place name where $l occurred?" ],
  [ "strength", "What were the sizes of the groups involved in $l?" ],
  [ "wordnet type", "What category does WordNet place $l into?" ],
  [ "writer", "Who was the author for the $l?" ],
],


[ // Politicians
  [ "alma Mater", "Where was $l educated?" ],
  [ "birth Date", "When was $l born?" ],
  [ "death Date", "When did $l die?" ],
  [ "nationality", "What country is $l from?" ],
  [ "party", "What was the political party of $l?" ],
  [ "religion", "What is $l's religion?" ],
  [ "predecessor", "Who was in office immediately before $l?" ], 
  [ "successor", "Who immediately followed $l in office?" ], 
  [ "spouse", "Who is married to $l?" ],
],


[ // Buildings
  [ "architect", "Who was the architect that designed $l?" ],
  [ ["style","architecture"], "What is the architectural style of $l?" ],
  [ "country", "In which country was $l located?" ],
  [ ["address","place","location"], "What is the place name where $l is located?" ],
  [ ["point","geometry"], "What are the map coordinates where $l is located?" ],
  [ ["latitude","point","geometry"], "At what latitude did $l is located?" ],
  [ ["longitude","point","geometry"], "At what longitude did $l is located?" ],
],


[ // Biology (short training set)
    [ "kj", "How many kilojoules of energy in $l?" ],
    [ "species", "To which species does $l belong?" ]
],


[ // Books
  [ ["author","writer"], "Who wrote $l?" ],
  [ "cover Artist", "Who illustrated the original cover of $l?" ],
  [ "country", "In which country was $l released?" ],
  [ "language", "What language is $l written in?" ],
  [ "publisher", "What is the name of the publisher of $l?" ],
  [ "isbn", "What is the ISBN number for $l?" ],
  [ "oclc", "What is the OCLC code for $l?" ],
  [ "dewey", "What is the Dewey Decimal classification for $l?" ],
  [ ["genre","literary Genre"], "What genre is $l?" ],
  [ "series", "What series is $l from?" ],
  [ ["followed By", "subsequent Work"], "What book came after $l?" ],
  [ ["preceded By", "previous Work"], "What book came before $l?" ],
]

];
