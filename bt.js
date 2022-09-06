float angle = 0.0;
ArrayList peers = new ArrayList();
ArrayList tmp = new ArrayList();
ArrayList connections = new ArrayList();
float rot = -1;
Torrent testTorrent = new Torrent(30);
int initPeers = 2;

void setup()
{

    size(450,450);
    fill(256);
    fill();
    textAlign(CENTER);

    generateStatTable();

    // establish initial seeds/peers
    for (int i = 0; i < initPeers; i++)
    {
	i % 2 == 0 ? addPeer(1) : addPeer();
    }

}

ArrayList shuffle(ArrayList input)
{
    ArrayList yin = new ArrayList();
    for (int i = 0;  i < input.size(); i++)
    {
	yin.add(input.get(i));
    }

    ArrayList temp = new ArrayList();
    while (yin.size() > 0)
    {
	int x = int(random(0, yin.size()));
	temp.add(yin.get(x));   
	yin.remove(x);      
    }
    return(temp);
}

class Bit
{
    int id;
    int bitHue;

    Bit(int i, int hu)
    {
	id = i;
	bitHue = hu;
    }
}


class Torrent
{
    ArrayList bits = new ArrayList();

    Torrent(int totbits)
    {
	for (int i=0; i < totbits; i ++)
	{
	    int ll = (255 / totbits) * i;
	    Bit k = new Bit(i, ll);
	    bits.add(k);
	}
    }
}

class Kibble
{
    float starttime;
    float endtime;
    float big;

    Kibble()
    {
	starttime = 0;
	endtime = 0;
	big = (random(0,4));
    }
}

class Peer
{
    int id;
    int index;
    float pwait;
    float sxpos; // x of peer
    float sypos; // y of peer
    float expos; // x of where peer should be
    float eypos; // y of where peer should be
    float cxpos;
    float cypos;
    float smovetime;
    float emovetime;
    float percent;
    float chue;
    float ehue;
    float shue;
    color ccolor;
    int removing;
    int lastcheck;
    ArrayList knex;
    ArrayList actBits;
    ArrayList myBits;
    ArrayList needBits;
    int balance;
    int reward;

    Peer(int i, float pct)
    {
	id = i;
	balance = 30;
	reward = 0;
	
	int szv = peers.size();
	if (szv == 0)
	{
	    szv++;
	}
	pwait = random(1, 9) * 1000;
	myBits = new ArrayList();
	needBits = new ArrayList();
	knex = new ArrayList();
	actBits = new ArrayList();

	pushMatrix();
	translate(width / 2, height / 2);
	ellipseMode(CENTER);
	float angle = 3 ;
	rotate(radians(angle));
	expos = (width / 2) + (230 * cos(radians(angle))); // screenX(0, 230)
	eypos = (height / 2) + (230 * sin(radians(angle))); // screenY(0, 230)
	sxpos = width / 2;
	sypos = height / 2;
	smovetime = millis();
	emovetime = smovetime + 1250;
	percent = pct;
	colorMode(HSB);

	lastcheck = millis();

	chue = 5;

	popMatrix();
	setupBits();
    }

    void setupBits()
    {
	for (int i = 0; i < testTorrent.bits.size(); i++)
	{
	    if (!myBits.contains(testTorrent.bits.get(i)))
	    {
		needBits.add(testTorrent.bits.get(i));
	    }
	}
    }

    void findPeer()
    {
	for (int i = 0; i < needBits.size(); i++)
	{
	    needBits = shuffle(needBits);
	    Bit b = (Bit)needBits.get(i);
	    for (int o = 0; o < peers.size(); o++)
	    {
		Peer p = (Peer)peers.get(o);
		if (p.myBits.contains(b) && !(p.removing > 0) && !(removing > 0) 
		    && !p.knex.contains((Peer)peers.get(index)) && p.index != index && 
		    !actBits.contains(b) /* && p.myBits.size() == 30 */)
		{
		    bitRequest(p,b);
		}
	    }
	}
    }

    void bitRequest(Peer k, Bit j)
    {
	if (k.knex.size() < 4) {
	    Connection mz = new Connection(k, (Peer)peers.get(index), j);
	    k.knex.add(peers.get(index));
	    actBits.add(j);
	    connections.add(mz);
	    f(mz,j);
	}
    }

    void reConfigure(int i)
    {
	int k;
	pushMatrix();
	translate(width / 2, height / 2);
	ellipseMode(CENTER);

	if (peers.size() == 0) {
	    k = 1;
	}
	else
	{
	    k = peers.size();
	}
	
	index = i;
	float angle = ((360 / k) * i) + rot;
	rotate(radians(angle));
	sxpos = cxpos;
	sypos = cypos;
	expos = (width / 2) + (180 * cos(radians(angle))); // screenX(0, 180, 0);
	eypos = (height / 2) + (180 * sin(radians(angle))); // screenY(0, 180, 0);
	smovetime= millis();
	emovetime= smovetime + 3000;

	popMatrix();
	shue = chue;
	ehue = (255 / peers.size() - 1) * i;

	ccolor = color(chue, 255, 255, 133);
    }

    void moveSelf()
    {
	if (millis() > emovetime)
	{
	    cxpos = expos;
	    cypos = eypos;
	    chue = ehue;
	} 
	else
	{
	    float diff = (millis() - smovetime) / (emovetime - smovetime);
	    cxpos = sxpos * (1 - diff) + expos * diff;
	    cypos = sypos * (1 - diff) + eypos * diff;
	    chue = shue * (1 - diff) + ehue * diff;
	}

    }

    void drawSelf()
    {
	fill(ccolor);

	stroke(myBits.size());
	// strokeWeight(1);
	noStroke();
	ellipseMode(CENTER);
	ellipse(cxpos, cypos, 50, 50);

	fill(0);
	float w = testTorrent.bits.size() - 1;
	rect(cxpos - w/2, cypos - 5, w, 10);
	for(int i = 0; i < myBits.size(); i++)
	{
	    Bit k = (Bit)myBits.get(i);
	    colorMode(HSB);
	    stroke(k.bitHue, 255, 255);
	    line(cxpos - w/2 + (1 * k.id), cypos - 5, cxpos - w / 2 + (1 * k.id), cypos + 5);
	}
    }

    void sb()
    {
	balance -= 1;
    }

    void sr()
    {
	reward += 1/2;
    }


    int gb()
    {
	return balance;
    }

    int gr()
    {
	return reward;
    }
}

class Connection
{
    int lastdraw;
    Peer from;
    Peer to;
    boolean stream;
    ArrayList kibbles;
    int deadkibbles;
    int speed;
    Bit theBit;

    Connection(Peer f, Peer t, Bit b)
    {
	theBit = (Bit)b;
	kibbles = new ArrayList()
	from = f;
	to = t;
	stream = true;
	lastdraw = millis();
	deadkibbles = 0;
	//speed = int(random(30,500));
	speed = int(random(1,3));
    }

    int getIdxTo()
    {
	return to.index;
    }

    int getIdxFrom()
    {
	return from.index;
    }


    void manageKibbles()
    {
	if (from.removing >= 1 || to.removing >= 1 || deadkibbles > 125)
	{ 
	    stream = false;  
	}
	else
	{
	    if (lastdraw < millis() - speed)
	    {   
		newKibble();
	    }
	}
    }

    void newKibble()
    {
	Kibble k = new Kibble();
	k.starttime = millis();
	k.endtime = k.starttime + 5000;
	kibbles.add(k);
	lastdraw = millis();
    }

    void drawKibbles()
    {
	for (int i = 0; i < kibbles.size(); i++)
	{
	    Kibble k = (Kibble)kibbles.get(i);
	    if(millis() > k.endtime)
	    {
		kibbles.remove(i);
		deadkibbles++;
	    }
	    else
	    {
		float diff = (millis() - k.starttime) / (k.endtime - k.starttime);

		float xpos = from.cxpos * (1 - diff) + (to.cxpos) * diff;
		float ypos = from.cypos * (1 - diff) + (to.cypos) * diff;

		colorMode(HSB);
		fill(theBit.bitHue, 255, 255);
		stroke(theBit.bitHue, 255, 255);
		strokeWeight(1); // k.big);
		ellipse(xpos, ypos, k.big, k.big);
	    }
	}
    }
}

void addPeer(int type)
{
    int id = Math.floor(100000 + Math.random() * 900000);
    Peer p = new Peer(id, random(0,1));
    peers.add(p);

    if (type == 1) {
	for (int i = 0; i < testTorrent.bits.size(); i++) {
	    p.myBits.add(testTorrent.bits.get(i));
	}

	p.needBits = new ArrayList();
    }


    generateTable(p, id);
}

void generateTable(Peer p, int id)
{   
    // generate table body
    // ArrayList actBits;
    // ArrayList myBits;
    // ArrayList needBits;        
    var tBody = document.getElementById("tbody");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td0 = document.createElement("td");
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");

    tr.setAttribute('id', id);    

    th.setAttribute('scope', 'row');
    th.innerHTML = id;

    td0.innerHTML = p.myBits.size();
    td1.innerHTML = p.needBits.size();
    td2.innerHTML = p.balance;
    td3.innerHTML = p.reward;
    
    tr.appendChild(th);
    tr.appendChild(td0);
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)
    
    tBody.appendChild(tr);
}

void generateStatTable()
{
    var tBodyTop = document.getElementById("tbodyTop");
    var trTop = document.createElement("tr");
    var thTop0 = document.createElement("th");
    var tdTop0 = document.createElement("td");
    var tdTop1 = document.createElement("td");
    var tdTop2 = document.createElement("td");
    var tdTop3 = document.createElement("td");
    
    var actionButton = document.createElement("a");
    actionButton.setAttribute('role', 'button');
    actionButton.setAttribute('class', 'btn btn-primary');
    actionButton.addEventListener("click", addPeer);
    tdTop3.appendChild(actionButton)
    
    actionButton.innerHTML = "Add New Peer";
        
    trTop.setAttribute('id', 'stats');
    thTop0.setAttribute('scope', 'row');
    
    thTop0.innerHTML = peers.size();;
    tdTop0.innerHTML = 0;
    tdTop1.innerHTML = 0;

    trTop.appendChild(thTop0);
    trTop.appendChild(tdTop0);
    trTop.appendChild(tdTop1);
    trTop.appendChild(tdTop2);
    trTop.appendChild(tdTop3);
    
    tBodyTop.append(trTop);


    // google play
    var thPlay = document.getElementById("play");
    var div = document.createElement("div");
    var a = document.createElement("a");
    var img = document.createElement("img");

    
    a.setAttribute('href', 'https://play.google.com/store/apps/details?id=org.proninyaroslav.libretorrent.iz&utm_source=bt251.com&utm_campaign=from_home&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1');
    
    img.setAttribute('src', 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png');
    img.setAttribute('alt', 'Get it on Google Play');

    
    a.appendChild(img);
    thPlay.appendChild(a);
    
}

void removePeer()
{
    int i = int(random(0,peers.size() - 1));
    Peer toRemove = (Peer)peers.get(i);
    toRemove.removing = 1;
}

void keyPressed()
{
    if (key == 'p') { 
	addPeer(0); // no seed
    }
    if (key == 's') { 
	addPeer(1);  // add seed
    }
    if (key == 'r') { 
	removePeer(); 
    }
}

void draw()
{
    background(0);

    // rotate peers and seeds (disabled by default)
    if (rot >= 0)
    {
	if (rot < 360)
	{
	    rot += .2;
	}
	else
	{
	    rot = rot - 360;
	}
    }

    for (int i = 0; i < connections.size(); i++)
    {
	Connection c = (Connection)connections.get(i);
	c.manageKibbles();
	c.drawKibbles();

	if ( c.kibbles.isEmpty() && c.stream == false )
	{
	    if (c.to.removing >= 1)
	    { 
		c.to.removing++;
	    }
	    if (c.from.removing >= 1)
	    { 
		c.from.removing++;
	    }

	    c.from.knex.remove(c.from.knex.indexOf(c.to));
	    c.to.myBits.add(c.theBit);
	    if (c.to.needBits.indexOf(c.theBit) != -1)
	    { 
		c.to.needBits.remove(c.to.needBits.indexOf(c.theBit));
	    }
	    if (c.to.knex.indexOf(c.theBit) != -1)
	    { 
		c.to.knex.remove(c.to.knex.indexOf(c.theBit));
	    }
	    connections.remove(i);
	}
    }

    for (int i = 0; i < peers.size(); i++)
    {
	Peer p = (Peer)peers.get(i);
	p.moveSelf();
	p.drawSelf();
	p.reConfigure(i);
	if (p.removing > 1)
	{
	    peers.remove(i);
	}
    }

    ArrayList tmp = shuffle(peers);
    for (int i = 0; i < tmp.size(); i++) {
	Peer cpeer = (Peer)tmp.get(i);
	if (cpeer.lastcheck < millis() - cpeer.pwait) {
	    cpeer.findPeer();
	    cpeer.lastcheck = millis();
	}
    }
}


void f(Connection k, Bit j)
{
    // from 30, to 0
    console.log(k.from.myBits.size(), k.to.myBits.size())
    
    // console.log(k.from.id, k.to.id, j.id);
    var fi = k.from.index;
    var ti = k.to.index;

    Peer src = peers.get(fi);
    Peer dst = peers.get(ti);

    src.sr(); // set src reward +1
    dst.sb(); // set dst balance -1
    
    var srctr = document.getElementById(src.id);
    // srctr.childNodes.item(1).innerHTML = src.actBits.size();
    srctr.childNodes.item(1).innerHTML = src.myBits.size();
    srctr.childNodes.item(2).innerHTML = src.needBits.size();
    srctr.childNodes.item(3).innerHTML = src.gb();
    srctr.childNodes.item(4).innerHTML = src.gr();

    var dsttr = document.getElementById(dst.id);
    // dsttr.childNodes.item(1).innerHTML = dst.actBits.size();
    dsttr.childNodes.item(1).innerHTML = dst.myBits.size();
    dsttr.childNodes.item(2).innerHTML = dst.needBits.size();
    dsttr.childNodes.item(3).innerHTML = dst.gb();
    dsttr.childNodes.item(4).innerHTML = dst.gr();

    var stats = document.getElementById("stats");
    stats.childNodes.item(0).innerHTML = peers.size();
    float art = parseFloat(stats.childNodes.item(1).innerHTML);
    stats.childNodes.item(1).innerHTML = (1*.25)+art;
    float bt = parseFloat(stats.childNodes.item(2).innerHTML);
    stats.childNodes.item(2).innerHTML = (1*.25)+bt
    

    //console.log(stats.childNodes.item(0));
}

